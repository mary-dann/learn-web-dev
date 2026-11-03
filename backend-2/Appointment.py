from fastapi import FastAPI, HTTPException
class Master:
    def __init__(self, master_id: int):
        self.master_id = master_id


class Service:
    def __init__(self, service_id: int, category_id: int = 1):
        self.service_id = service_id
        self.category_id = category_id


class Category:
    def __init__(self, category_id: int, name: str):
        self.id = category_id
        self.name = name


MASTERS = {1: Master(1)}

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


def get_master(master_id: int) -> Master | None:
    return MASTERS.get(master_id)


def get_service(service_id: int) -> Service | None:
    return SERVICES.get(service_id)


class Appointment:
    def __init__(self, client_name: str, master_id: int, service_id: int, time: str):
        self.id = len(appointments) + 1
        self.client_name = client_name
        self.master_id = master_id
        self.service_id = service_id
        self.time = time


appointments = []


def is_working_hours(time: str) -> bool:
    """Рабочие часы салона: с 08:00 до 20:00."""
    try:
        hours, minutes = map(int, time.split(":"))
    except (ValueError, AttributeError):
        return False

    if not (0 <= hours < 24 and 0 <= minutes < 60):
        return False

    return 8 <= hours <= 20 and (hours < 20 or minutes == 0)


def create_appointment(client_name: str,
                       master_id: int,
                       service_id: int,
                       time: str) -> Appointment | None:
    master = get_master(master_id)
    service = get_service(service_id)

    if master is None or service is None:
        return None

    if not client_name or not time:
        return None

    if not is_working_hours(time):
        return None

    appointment = Appointment(
        client_name=client_name,
        master_id=master.master_id,
        service_id=service.service_id,
        time=time,
    )
    appointments.append(appointment)
    return appointment


def services_count(category_id: int) -> int:
    """Сколько услуг привязано к категории."""
    return sum(1 for s in SERVICES.values() if s.category_id == category_id)


app = FastAPI(title="Салон красоты API", version="1.0.0")


@app.get("/", tags=["root"])
def root():
    return {"message": "API работает. Откройте /docs для Swagger UI"}

# Задание 1. Список всех категорий с количеством услуг.
@app.get("/categories", tags=["categories"])
def get_categories():
    return [
        {"id": c.id, "name": c.name, "servicesCount": services_count(c.id)}
        for c in CATEGORIES.values()
    ]

# Задание 2. Информация о конкретной категории.
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


if __name__ == "__main__":
    first_appointment = create_appointment("Иванова А.А.", 1, 1, '10:00')
    second_appointment = create_appointment("Петрова А.А.", 1, 1, '11:00')
    print("Список записей:")
    for appointment in appointments:
        print(appointment.client_name, appointment.time)

    appointments.clear()
    create_appointment("", 1, 1, '12:00')
    print(len(appointments))  # 0

    appointments.clear()
    create_appointment("Сидорова А.А.", 1, 1, '00:00')
    print(len(appointments))  # 0