import json
import math
import re

# Helper function to generate term frequencies for simulated vector cosine calculations
def tokenize(text: str) -> list:
    return re.findall(r'\w+', text.lower())

def get_term_frequency(tokens: list) -> dict:
    tf = {}
    for t in tokens:
        tf[t] = tf.get(t, 0) + 1
    return tf

def calculate_cosine_similarity(text1: str, text2: str) -> float:
    t1 = tokenize(text1)
    t2 = tokenize(text2)
    if not t1 or not t2:
        return 0.0
        
    tf1 = get_term_frequency(t1)
    tf2 = get_term_frequency(t2)
    
    # Calculate Dot Product
    dot_product = 0.0
    for term, freq in tf1.items():
        if term in tf2:
            dot_product += freq * tf2[term]
            
    # Calculate magnitudes
    mag1 = math.sqrt(sum(f ** 2 for f in tf1.values()))
    mag2 = math.sqrt(sum(f ** 2 for f in tf2.values()))
    
    if mag1 == 0 or mag2 == 0:
        return 0.0
        
    return dot_product / (mag1 * mag2)
