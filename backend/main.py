import db.bcrypt_patch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base, SessionLocal
from api import auth, admin, connectors, workflows, intelligence, agents, collaboration, health, notifications, portfolio, releases, resources, scenario, search, pm_messenger, pm_documents, pm_meetings, pm_prds, messages, whiteboards, shares, analytics, prd, prioritize, stories, strategy, warroom, experimentation, copilot_collaboration
from db.seed import seed_multitenant_data
from fastapi.staticfiles import StaticFiles
import os

# Initialize database schemas (detect if schema update is needed)
from sqlalchemy import inspect
inspector = inspect(engine)
recreate_needed = False
if "vector_documents" in inspector.get_table_names():
    columns = [col["name"] for col in inspector.get_columns("vector_documents")]
    if "tenant_id" not in columns:
        recreate_needed = True

if "documents" in inspector.get_table_names():
    columns = [col["name"] for col in inspector.get_columns("documents")]
    if "storage_path" not in columns:
        recreate_needed = True

if "workflow_actions" in inspector.get_table_names():
    columns = [col["name"] for col in inspector.get_columns("workflow_actions")]
    if "comments" not in columns:
        recreate_needed = True

if "prds" not in inspector.get_table_names():
    recreate_needed = True

if "whiteboards" not in inspector.get_table_names():
    recreate_needed = True

if "share_permissions" not in inspector.get_table_names():
    recreate_needed = True

if recreate_needed:
    print("Database schema out of date. Recreating tables for Multi-Tenancy, Operations Platform & PM Workspaces...")
    try:
        Base.metadata.drop_all(bind=engine)
    except Exception as e:
        print(f"Error dropping tables: {e}")

Base.metadata.create_all(bind=engine)

# Seed Vector RAG and multi-tenant default chunks
db = SessionLocal()
try:
    seed_multitenant_data(db)
finally:
    db.close()

app = FastAPI(
    title="ICDF Backend API",
    description="Intelligent Continuous Delivery Framework Enterprise SaaS API Engine",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow Vite ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse
from auth.rbac import ROLES_PERMISSIONS

@app.middleware("http")
async def rbac_middleware(request: Request, call_next):
    path = request.url.path
    if (path.startswith("/auth") or 
        path == "/" or 
        path == "/openapi.json" or 
        path.startswith("/docs") or 
        path.startswith("/uploads") or 
        path.startswith("/redoc")):
        return await call_next(request)
        
    role_header = request.headers.get("x-user-role", "Guest")
    
    # Resolve role to match backend permissions keys case-insensitively
    matched_role = None
    role_normalized = role_header.lower().replace(" ", "").replace("_", "").replace("/", "")
    for r_name in ROLES_PERMISSIONS.keys():
        if r_name.lower().replace(" ", "").replace("_", "").replace("/", "") == role_normalized:
            matched_role = r_name
            break
            
    if not matched_role:
        matched_role = "Guest"
        
    if path.startswith("/admin") or path.startswith("/connectors"):
        if matched_role not in ["Admin", "Governance Manager", "Compliance Officer"]:
            return JSONResponse(
                status_code=403,
                content={"detail": f"Access denied: Role '{role_header}' is not authorized to access administrative endpoints."}
            )
            
    if path.startswith("/releases"):
        allowed_roles = [
            "Admin", "Program Manager", "Delivery Manager", "Executive", 
            "Product Manager", "QA Lead", "QA", "Developer", "Dev Lead", 
            "Architect", "Project Manager", "Portfolio Manager", "Scrum Master"
        ]
        if matched_role not in allowed_roles:
            return JSONResponse(
                status_code=403,
                content={"detail": f"Access denied: Role '{role_header}' is not authorized to access release/deployment endpoints."}
            )

    if path.startswith("/portfolio") or path.startswith("/resources"):
        allowed_roles = ["Admin", "Executive", "Product Manager", "Program Manager", "Delivery Manager", "Portfolio Manager"]
        if matched_role not in allowed_roles:
            return JSONResponse(
                status_code=403,
                content={"detail": f"Access denied: Role '{role_header}' is not authorized to access portfolio or resource allocation configurations."}
            )

    response = await call_next(request)
    return response

# Include Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(connectors.router)
app.include_router(workflows.router)
app.include_router(intelligence.router)
app.include_router(agents.router)
app.include_router(collaboration.router)
app.include_router(health.router)
app.include_router(notifications.router)
app.include_router(portfolio.router)
app.include_router(releases.router)
app.include_router(resources.router)
app.include_router(scenario.router)
app.include_router(search.router)
app.include_router(pm_messenger.router)
app.include_router(pm_documents.router)
app.include_router(pm_meetings.router)
app.include_router(pm_prds.router)
app.include_router(messages.router)
app.include_router(whiteboards.router)
app.include_router(shares.router)

# Include AI PM Copilot routers
app.include_router(prd.router, prefix="/api", tags=["PRD"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(stories.router, prefix="/api", tags=["Stories"])
app.include_router(prioritize.router, prefix="/api", tags=["Prioritization"])
app.include_router(strategy.router, prefix="/api", tags=["Strategy"])
app.include_router(warroom.router, prefix="/api", tags=["War Room"])
app.include_router(experimentation.router, prefix="/api", tags=["Experimentation"])
app.include_router(copilot_collaboration.router, prefix="/api", tags=["Collaboration"])


# Mount static uploads directory
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "service": "Intelligent Continuous Delivery Framework Engine",
        "version": "1.0.0",
        "db_driver": engine.name
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8109, reload=False)
