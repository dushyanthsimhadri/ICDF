from sqlalchemy.orm import Session
from db.models import IntegrationConnector, SyncLog
import datetime

def check_connector_health_telemetry(db: Session) -> list:
    conns = db.query(IntegrationConnector).all()
    results = []
    
    for c in conns:
        # Calculate dynamic health score
        health = 100 - (c.error_count * 15)
        health = max(0, health)
        
        # Check token expiration
        token_status = "Valid"
        if c.token_expiry and c.token_expiry < datetime.datetime.utcnow():
            token_status = "Expired"
            health = max(0, health - 40)
            
        c.health_score = health
        db.commit()
        
        results.append({
            "name": c.name,
            "status": c.status,
            "health_score": health,
            "error_count": c.error_count,
            "token_status": token_status,
            "last_sync": c.last_sync.isoformat() if c.last_sync else None
        })
        
    return results

def log_sync_event(connector_name: str, status: str, error_msg: str, duration: int, db: Session):
    # Log sync status
    log = SyncLog(
        connector_name=connector_name,
        status=status,
        error_details=error_msg,
        sync_duration_ms=duration
    )
    db.add(log)
    
    # Update Connector errors
    conn = db.query(IntegrationConnector).filter(IntegrationConnector.name == connector_name).first()
    if conn:
        conn.last_sync = datetime.datetime.utcnow()
        if status == "Failed":
            conn.status = "Error"
            conn.error_count += 1
        else:
            conn.status = "Connected"
            conn.error_count = max(0, conn.error_count - 1)
            
    db.commit()
