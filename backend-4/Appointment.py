from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, String, Integer, Float, Text, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session, sessionmaker

DATABASE_URL = "sqlite:///salon.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass

class Master(Base):
    __tablename__ = "masters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    specialization: Mapped[str] = mapped_column(String, nullable=False)


class ServiceModel(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    desc: Mapped[str] = mapped_column(Text, nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)


class ServiceCreate(BaseModel):
    categoryId: int = Field(..., gt=0, description="ID категории")
    title: str = Field(..., min_length=1, max_length=100, description="Название услуги")
    desc: str = Field(..., min_length=1, max_length=100, description="Описание услуги")
    duration: int = Field(..., ge=30, le=180, description="Продолжительность, минуты (30–180)")
    price: float = Field(..., gt=0, description="Стоимость, > 0")


class Service:
    """Старый Python-класс для словаря SERVICES (категории)."""
    def __init__(self, service_id: int, category_id: int = 1):
        self.service_id = service_id
        self.category_id = category_id


class Category:
    def __init__(self, category_id: int, name: str):
        self.id = category_id
        self.name = name


SERVICES = {
    1: Service(1, 1), 2: Service(2, 1), 3: Service(3, 1), 4: Service(4, 1), 5: Service(5, 1),
    6: Service(6, 2), 7: Service(7, 2), 8: Service(8, 2), 9: Service(9, 2), 10: Service(10, 2),
    11: Service(11, 3), 12: Service(12, 3), 13: Service(13, 3), 14: Service(14, 3),
    15: Service(15, 4), 16: Service(16, 4), 17: Service(17, 4), 18: Service(18, 4),
}

CATEGORIES = {
    1: Category(1, "Стрижки и укладки"),
    2: Category(2, "Маникюр и педикюр"),
    3: Category(3, "Брови и ресницы"),
    4: Category(4, "Спа-процедуры"),
}


def get_service(service_id: int) -> Service | None:
    return SERVICES.get(service_id)


def get_master_from_db(db: Session, master_id: int) -> Master | None:
    return db.get(Master, master_id)


# запись клиента
class Appointment:
    def __init__(self, client_name: str, master_id: int, service_id: int, time: str):
        self.id = len(appointments) + 1
        self.client_name = client_name
        self.master_id = master_id
        self.service_id = service_id
        self.time = time


appointments = []


def is_working_hours(time: str) -> bool:
    try:
        hours, minutes = map(int, time.split(":"))
    except (ValueError, AttributeError):
        return False
    if not (0 <= hours < 24 and 0 <= minutes < 60):
        return False
    return 8 <= hours <= 20 and (hours < 20 or minutes == 0)


def create_appointment(client_name: str, master_id: int, service_id: int, time: str) -> Appointment | None:
    service = get_service(service_id)
    if service is None:
        return None
    with SessionLocal() as db:
        master = get_master_from_db(db, master_id)
    if master is None:
        return None
    if not client_name or not time:
        return None
    if not is_working_hours(time):
        return None
    appointment = Appointment(
        client_name=client_name,
        master_id=master.id,
        service_id=service.service_id,
        time=time,
    )
    appointments.append(appointment)
    return appointment


# API
app = FastAPI(title="Салон красоты API", version="3.0.0")


@app.get("/", tags=["root"])
def root():
    return {"message": "API работает. Откройте /docs для Swagger UI"}


# --- Категории (как было) ---
def services_count(category_id: int) -> int:
    return sum(1 for s in SERVICES.values() if s.category_id == category_id)


@app.get("/categories", tags=["categories"])
def get_categories():
    return [
        {"id": c.id, "name": c.name, "servicesCount": services_count(c.id)}
        for c in CATEGORIES.values()
    ]


@app.get("/categories/{category_id}", tags=["categories"])
def get_category(category_id: int):
    category = CATEGORIES.get(category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return {
        "id": category.id,
        "name": category.name,
        "servicesCount": services_count(category.id),
    }


@app.get("/masters", tags=["masters"])
def get_masters(specialization: str | None = None):
    with SessionLocal() as db:
        stmt = select(Master).order_by(Master.id)
        if specialization:
            stmt = stmt.where(Master.specialization == specialization)
        masters = db.scalars(stmt).all()
        return [{"id": m.id, "name": m.name, "specialization": m.specialization} for m in masters]


@app.get("/masters/{master_id}", tags=["masters"])
def get_master(master_id: int):
    with SessionLocal() as db:
        master = db.get(Master, master_id)
        if master is None:
            raise HTTPException(status_code=404, detail="Master not found")
        return {"id": master.id, "name": master.name, "specialization": master.specialization}



@app.post("/services", status_code=status.HTTP_201_CREATED, tags=["services"])
def create_service(payload: ServiceCreate):
    """Создать услугу. В БД пишутся только корректные данные (валидация Pydantic)."""
    with SessionLocal() as db:
        service = ServiceModel(
            category_id=payload.categoryId,
            title=payload.title,
            desc=payload.desc,
            duration=payload.duration,
            price=payload.price,
        )
        db.add(service)
        db.commit()
        db.refresh(service)
        return {
            "id": service.id,
            "categoryId": service.category_id,
            "title": service.title,
            "desc": service.desc,
            "duration": service.duration,
            "price": service.price,
        }


@app.get("/services", tags=["services"])
def get_services():
    """Список услуг из БД (для проверки, что POST сработал)."""
    with SessionLocal() as db:
        services = db.scalars(select(ServiceModel).order_by(ServiceModel.id)).all()
        return [
            {
                "id": s.id,
                "categoryId": s.category_id,
                "title": s.title,
                "desc": s.desc,
                "duration": s.duration,
                "price": s.price,
            }
            for s in services
        ]


# создание таблиц
Base.metadata.create_all(bind=engine)


def seed_masters() -> None:
    with SessionLocal() as db:
        if db.scalars(select(Master)).first() is None:
            db.add_all([
                Master(name="Анна", specialization="Парикмахер"),
                Master(name="Мария", specialization="Визажист"),
            ])
            db.commit()


seed_masters()


if __name__ == "__main__":
    first_appointment = create_appointment("Иванова А.А.", 1, 1, '10:00')
    second_appointment = create_appointment("Петрова А.А.", 1, 1, '11:00')
    print("Список записей:")
    for appointment in appointments:
        print(appointment.client_name, appointment.time)

    appointments.clear()
    create_appointment("", 1, 1, '12:00')
    print(len(appointments))

    appointments.clear()
    create_appointment("Сидорова А.А.", 1, 1, '00:00')
    print(len(appointments))