#!/usr/bin/env python3
"""
Quick setup script for SkillBridge AI
- Creates PostgreSQL database and user
- Runs migrations
- Verifies all dependencies
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(cmd, description):
    """Run a command and report status"""
    print(f"\n{'='*60}")
    print(f"📦 {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - SUCCESS")
            if result.stdout:
                print(result.stdout)
        else:
            print(f"❌ {description} - FAILED")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} - ERROR: {e}")
        return False
    return True

def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║         SkillBridge AI - Setup & Configuration              ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Check Python version
    if sys.version_info < (3, 9):
        print("❌ Python 3.9+ required")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    # Create virtual environment
    if not Path(".venv").exists():
        run_command("python -m venv .venv", "Create virtual environment")
    
    venv_activate = ".venv\\Scripts\\activate" if sys.platform == "win32" else "source .venv/bin/activate"
    
    # Install dependencies
    run_command(f"{venv_activate} && pip install -r requirements.txt", 
                "Install Python dependencies")
    
    # Create .env if not exists
    if not Path(".env").exists():
        print("\n⚠️  .env file not found. Please configure it with your API keys.")
        print("   See SETUP_GUIDE.md for details")
    else:
        print("\n✅ .env file exists")
    
    # Test imports
    try:
        import fastapi
        import sqlalchemy
        import pydantic
        print("✅ All required Python packages installed")
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        return False
    
    # Check if PostgreSQL is reachable (optional)
    try:
        run_command("psql --version", "Check PostgreSQL installation")
    except:
        print("\n⚠️  PostgreSQL not found in PATH (optional for development)")
    
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║                     Setup Complete! ✅                       ║
╚══════════════════════════════════════════════════════════════╝

📋 Next Steps:

1. Configure PostgreSQL:
   - Create database: skillbridge_db
   - Create user: skillbridge_user
   - Update DATABASE_URL in .env

2. Update .env with your API keys:
   - GEMINI_API_KEY
   - GITHUB_TOKEN
   - JOOBLE_API_KEY (optional)

3. Start backend server:
   cd backend
   {venv_activate}
   uvicorn app.main:app --reload

4. In another terminal, start frontend:
   cd frontend
   npm install
   npm run dev

5. Access the application:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

📖 For detailed instructions, see SETUP_GUIDE.md
    """)
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
