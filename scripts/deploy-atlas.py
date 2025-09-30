#!/usr/bin/env python3
"""
Deploy BrainSAIT Database to MongoDB Atlas Cluster0
Free tier deployment for production
"""

from pymongo import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
import uuid

# Atlas connection
ATLAS_URI = "mongodb+srv://fadil_db_user:1rlK8vj6YF5reQoc@cluster0.ozzjwto.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "brainsait_platform"

def deploy_to_atlas():
    """Deploy BrainSAIT to Atlas Cluster0"""
    print("🚀 Deploying BrainSAIT to MongoDB Atlas Cluster0")
    
    client = MongoClient(ATLAS_URI, server_api=ServerApi('1'))
    db = client[DB_NAME]
    
    # Create indexes
    print("📋 Creating indexes...")
    db.hospitals.create_index("hospital_id")
    db.hospitals.create_index("location.region")
    db.patients.create_index("patient_id")
    db.patients.create_index("hospital_id")
    db.ai_models.create_index("deployment_status")
    db.vision2030_metrics.create_index("measurement_date")
    
    # Sample hospital
    hospital = {
        "hospital_id": str(uuid.uuid4()),
        "name": "King Fahd Medical City",
        "location": {
            "city": "Riyadh",
            "region": "Central",
            "coordinates": {"lat": 24.7136, "lng": 46.6753}
        },
        "license_number": "RYD-001-2024",
        "capacity": {"beds": 500, "icu": 50, "emergency": 30},
        "specializations": ["Cardiology", "Oncology", "Neurology", "Emergency"],
        "digital_maturity_level": 4,
        "vision2030_compliance": {
            "health_sector_transformation": True,
            "digital_health_adoption": 85,
            "ai_integration_level": 4
        },
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    hospital_result = db.hospitals.insert_one(hospital)
    print(f"✅ Hospital created: {hospital['name']}")
    
    # Sample AI model
    ai_model = {
        "model_id": str(uuid.uuid4()),
        "name": "CardioPredict AI",
        "type": "predictive",
        "version": "2.0.0",
        "healthcare_domain": "cardiology",
        "performance_metrics": {
            "accuracy": 0.942,
            "precision": 0.921,
            "recall": 0.895,
            "f1_score": 0.908
        },
        "deployment_status": "production",
        "vision2030_alignment": {
            "innovation_contribution": 9,
            "quality_improvement": 8,
            "efficiency_gain": 7
        },
        "created_at": datetime.now(),
        "last_updated": datetime.now()
    }
    
    db.ai_models.insert_one(ai_model)
    print(f"✅ AI Model deployed: {ai_model['name']}")
    
    # Vision 2030 metrics
    vision_metrics = {
        "metric_id": str(uuid.uuid4()),
        "hospital_id": str(hospital_result.inserted_id),
        "vision2030_goals": {
            "health_sector_transformation": {
                "digital_health_adoption": 85,
                "ai_integration": 80,
                "patient_experience": 90
            },
            "innovation_economy": {
                "tech_adoption": 75,
                "research_contribution": 70,
                "startup_collaboration": 60
            },
            "sustainability": {
                "resource_efficiency": 80,
                "environmental_impact": 75,
                "social_responsibility": 85
            }
        },
        "overall_alignment_score": 78.3,
        "measurement_date": datetime.now()
    }
    
    db.vision2030_metrics.insert_one(vision_metrics)
    print("✅ Vision 2030 metrics configured")
    
    # Verify deployment
    print("\n📊 Atlas Deployment Summary:")
    print(f"Hospitals: {db.hospitals.count_documents({})}")
    print(f"AI Models: {db.ai_models.count_documents({})}")
    print(f"Vision 2030 Metrics: {db.vision2030_metrics.count_documents({})}")
    print(f"Database: {DB_NAME}")
    print(f"Cluster: Cluster0 (Free Tier)")
    
    print("\n🎯 Production Ready!")
    print("✅ Atlas Cluster0 configured for BrainSAIT")
    print("💰 Free tier maintained - no additional costs")
    
    client.close()

if __name__ == "__main__":
    deploy_to_atlas()