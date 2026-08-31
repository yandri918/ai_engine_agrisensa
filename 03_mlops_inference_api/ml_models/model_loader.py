"""ML Model loader with lazy loading and caching, independent of Flask."""
import os
import joblib
import threading
import logging
from config import settings

logger = logging.getLogger("mlops_api.model_loader")
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL), format=settings.LOG_FORMAT)

class ModelLoader:
    """Singleton class for loading and caching ML models."""
    
    _instance = None
    _lock = threading.Lock()
    _model_cache = {}
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    @classmethod
    def get_model(cls, model_name):
        """
        Get ML model with lazy loading and caching.
        
        Args:
            model_name: Name of the model to load
            
        Returns:
            Loaded model or None if not found
        """
        with cls._lock:
            # Return cached model if available
            if model_name in cls._model_cache:
                return cls._model_cache[model_name]
            
            model_paths = settings.MODEL_PATHS
            ml_models_path = settings.ML_MODELS_PATH
            
            if model_name not in model_paths:
                logger.warning(f"Model '{model_name}' not found in MODEL_PATHS")
                cls._model_cache[model_name] = None
                return None
            
            # Construct full path
            model_file = model_paths[model_name]
            full_path = os.path.join(ml_models_path, model_file)
            
            # Load model
            if os.path.exists(full_path):
                try:
                    loaded_data = joblib.load(full_path)
                    if isinstance(loaded_data, dict) and 'pipeline' in loaded_data:
                        cls._model_cache[model_name] = loaded_data['pipeline']
                    else:
                        cls._model_cache[model_name] = loaded_data
                    logger.info(f"Model '{model_name}' loaded successfully from {full_path}")
                except Exception as e:
                    logger.error(f"Failed to load model '{model_name}' from {full_path}: {e}")
                    cls._model_cache[model_name] = None
            else:
                logger.warning(f"Model file not found: {full_path}")
                cls._model_cache[model_name] = None
            
            return cls._model_cache[model_name]
    
    @classmethod
    def clear_cache(cls):
        """Clear all cached models."""
        with cls._lock:
            cls._model_cache.clear()
            logger.info("Model cache cleared")
