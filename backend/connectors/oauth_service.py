from sqlalchemy.orm import Session
from db.models import IntegrationConnector
import datetime

# Mock OAuth Service client
def generate_oauth_authorization_url(connector_name: str) -> str:
    # URL directions
    client_ids = {
        "Jira": "jira_client_id_enterprise_v2",
        "GitHub": "github_client_id_enterprise_v2",
        "Slack": "slack_client_id_enterprise_v2"
    }
    cid = client_ids.get(connector_name, "default_client")
    return f"https://auth.enterprise.com/oauth/authorize?response_type=code&client_id={cid}&redirect_uri=http://localhost:8000/connectors/callback&state={connector_name.lower()}"

def process_oauth_callback(connector_name: str, code: str, db: Session) -> dict:
    conn = db.query(IntegrationConnector).filter(IntegrationConnector.name == connector_name).first()
    if not conn:
        conn = IntegrationConnector(name=connector_name)
        db.add(conn)
        
    # Simulate exchange code for access token
    mock_token = f"oauth_token_ref_{connector_name.lower()}_98273b7936aef"
    expiry_time = datetime.datetime.utcnow() + datetime.timedelta(hours=24) # Valid for 24h
    
    conn.status = "Connected"
    conn.config_details = mock_token
    conn.token_expiry = expiry_time
    conn.error_count = 0
    db.commit()
    
    return {
        "status": "Success",
        "connector": connector_name,
        "token": mock_token,
        "expires_at": expiry_time.isoformat()
    }
