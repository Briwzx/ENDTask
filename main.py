from fastapi import FastAPI, HTTPException
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import yaml

app = FastAPI(
    title="ENDTask API",
    description="Documentación Swagger generada automáticamente para el proyecto ENDTask.",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
)

app.mount("/static", StaticFiles(directory="static"), name="static")

class Settings(BaseModel):
    limite_diario: int = Field(6, description="Máximo de horas permitidas por día para subtareas")

class UserProfile(BaseModel):
    id: str = Field(..., example="user_123")
    nombre_completo: str = Field(..., example="Ana Pérez")
    email: EmailStr = Field(..., example="ana.perez@example.com")
    settings: Settings = Field(default_factory=Settings)

class RegisterData(BaseModel):
    nombre_completo: str = Field(..., example="Ana Pérez")
    email: EmailStr = Field(..., example="ana.perez@example.com")
    password: str = Field(..., example="Secret1234")
    email_institucional: Optional[EmailStr] = Field(None, example="ana.perez@universidad.edu")

class LoginData(BaseModel):
    email: EmailStr = Field(..., example="ana.perez@example.com")
    password: str = Field(..., example="Secret1234")

class AuthResponse(BaseModel):
    access_token: str = Field(..., example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")
    token_type: str = Field("bearer")

class CourseBase(BaseModel):
    nombre: str = Field(..., example="Matemáticas")
    fecha: str = Field(..., example="10 Febrero")
    color: Optional[str] = Field(None, example="#4F46E5")

class Course(CourseBase):
    id: str = Field(..., example="course_123")
    user_id: str = Field(..., example="user_123")

class Subtask(BaseModel):
    id: str = Field(..., example="subtask_123")
    nombre: str = Field(..., example="Resolver ejercicio 5")
    fecha: str = Field(..., example="12 Marzo")
    horas: int = Field(..., example=2)
    estado: str = Field(..., example="Pendiente")

class TaskBase(BaseModel):
    nombre: str = Field(..., example="Estudiar para examen")
    descripcion: Optional[str] = Field(None, example="Repasar los capítulos 1 a 4")
    estado: str = Field(..., example="Pendiente")
    prioridad: str = Field(..., example="Alta")
    curso: str = Field(..., example="Matemáticas")
    inicio: str = Field(..., example="10 Febrero")
    fin: str = Field(..., example="15 Febrero")
    subtareas: Optional[List[Subtask]] = []

class Task(TaskBase):
    id: str = Field(..., example="task_123")
    user_id: str = Field(..., example="user_123")

@app.get("/", tags=["General"], summary="Mensaje de bienvenida")
async def root():
    return {"message": "Bienvenido a ENDTask API"}

@app.get("/openapi.yaml", include_in_schema=False, summary="Especificación OpenAPI en YAML")
async def openapi_yaml():
    app.openapi_schema = None
    spec = app.openapi()
    yaml_text = yaml.safe_dump(spec, sort_keys=False, allow_unicode=True)
    with open("openapi.yaml", "w", encoding="utf-8") as f:
        f.write(yaml_text)
    return PlainTextResponse(yaml_text, media_type="application/x-yaml")

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    html = get_swagger_ui_html(
        openapi_url="/openapi.yaml",
        title=f"{app.title} - Swagger UI",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
    )
    content = html.body.decode("utf-8")
    head_injection = '<link rel="stylesheet" type="text/css" href="/static/swagger-docs.css" />'
    body_injection = '<script src="/static/swagger-docs.js"></script>'
    content = content.replace("</head>", f"{head_injection}</head>")
    content = content.replace("</body>", f"{body_injection}</body>")
    return HTMLResponse(content=content, status_code=html.status_code)

@app.post("/auth/register", tags=["Auth"], response_model=UserProfile, summary="Registrar nuevo usuario")
async def register(data: RegisterData):
    return UserProfile(
        id="user_123",
        nombre_completo=data.nombre_completo,
        email=data.email,
        settings=Settings(),
    )

@app.post("/auth/login", tags=["Auth"], response_model=AuthResponse, summary="Iniciar sesión de usuario")
async def login(data: LoginData):
    return AuthResponse(access_token="token_de_ejemplo", token_type="bearer")

@app.get("/users/me", tags=["Usuarios"], response_model=UserProfile, summary="Obtener perfil del usuario logueado")
async def get_current_user():
    return UserProfile(
        id="user_123",
        nombre_completo="Ana Pérez",
        email="ana.perez@example.com",
        settings=Settings(limite_diario=6),
    )

@app.put("/users/me/profile", tags=["Usuarios"], response_model=UserProfile, summary="Actualizar perfil del usuario")
async def update_user_profile(profile: UserProfile):
    return profile

@app.get("/courses", tags=["Cursos"], response_model=List[Course], summary="Listar cursos del usuario")
async def get_courses():
    return [
        Course(id="course_123", nombre="Matemáticas", fecha="10 Febrero", color="#4F46E5", user_id="user_123"),
    ]

@app.post("/courses", tags=["Cursos"], response_model=Course, summary="Agregar un curso")
async def add_course(course: CourseBase):
    return Course(id="course_124", user_id="user_123", **course.dict())

@app.delete("/courses/{course_id}", tags=["Cursos"], summary="Eliminar un curso")
async def delete_course(course_id: str):
    return {"status": "deleted", "id": course_id}

@app.get("/tasks", tags=["Tareas"], response_model=List[Task], summary="Listar tareas del usuario")
async def get_tasks():
    return [
        Task(
            id="task_123",
            user_id="user_123",
            nombre="Estudiar para examen",
            descripcion="Repasar los capítulos 1 a 4",
            estado="Pendiente",
            prioridad="Alta",
            curso="Matemáticas",
            inicio="10 Febrero",
            fin="15 Febrero",
            subtareas=[
                Subtask(id="subtask_123", nombre="Resolver ejercicio 5", fecha="12 Febrero", horas=2, estado="Pendiente"),
            ],
        )
    ]

@app.post("/tasks", tags=["Tareas"], response_model=Task, summary="Agregar una tarea")
async def add_task(task: TaskBase):
    return Task(id="task_124", user_id="user_123", **task.dict())

@app.put("/tasks/{task_id}", tags=["Tareas"], response_model=Task, summary="Actualizar una tarea")
async def update_task(task_id: str, task: TaskBase):
    return Task(id=task_id, user_id="user_123", **task.dict())

@app.delete("/tasks/{task_id}", tags=["Tareas"], summary="Eliminar una tarea")
async def delete_task(task_id: str):
    return {"status": "deleted", "id": task_id}
