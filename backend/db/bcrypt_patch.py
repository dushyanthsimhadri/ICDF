import bcrypt

# 1. Fix missing __about__ attribute in newer bcrypt library
if not hasattr(bcrypt, "__about__"):
    class MockAbout:
        __version__ = "4.0.0"
    bcrypt.__about__ = MockAbout

# 2. Fix ValueError for passwords > 72 bytes in newer bcrypt library (used by passlib wrap checks)
orig_hashpw = bcrypt.hashpw
def patched_hashpw(password, salt):
    # Ensure inputs are handled correctly as bytes
    password_bytes = password
    if isinstance(password, str):
        password_bytes = password.encode('utf-8')
        
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        
    return orig_hashpw(password_bytes, salt)

bcrypt.hashpw = patched_hashpw
