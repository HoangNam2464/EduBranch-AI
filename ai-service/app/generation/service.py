"""
EduBranch AI — Case Generation Service.
"""
import uuid
from typing import Any

from app.core.config import settings
from app.core.logging import logger
from app.providers.factory import get_provider
from app.retrieval.service import retrieve_chunks, build_rag_context
from app.generation.schemas.requests import CaseGenerationRequest, CaseGenerationResponse
from app.generation.schemas.decision_tree import CaseGenerationOutput, CASE_GENERATION_JSON_SCHEMA


async def generate_case(request: CaseGenerationRequest) -> CaseGenerationResponse:
    """
    Generate a decision tree case based on requested materials and topic.
    """
    logger.info("generate_case_started", course_id=request.course_id, topic_hint=request.topic_hint)

    # 1. Retrieve context
    query = request.topic_hint if request.topic_hint else "University case study generation"
    
    # We pass the strings of material_ids
    material_ids_str = [str(m) for m in request.material_ids]
    
    try:
        chunks = await retrieve_chunks(
            query=query,
            course_id=str(request.course_id),
            material_ids=material_ids_str,
            top_k=settings.rag_top_k
        )
    except Exception as e:
        logger.error(f"Failed to retrieve chunks: {e}")
        chunks = []
        
    rag_context = build_rag_context(chunks)
    source_chunk_ids = [c.chunk_id for c in chunks]

    # 2. Check if we have an API key to do real generation, else mock
    has_api_key = False
    if settings.ai_provider == "openai" and settings.openai_api_key:
        has_api_key = True
    elif settings.ai_provider == "gemini" and settings.gemini_api_key:
        has_api_key = True
        
    prompt = f"""
Topic Hint: {query}
Approximate target nodes: {request.num_nodes}

Context:
{rag_context}
"""

    system_prompt = """
You are an expert university professor creating a branching case study.
Generate a valid JSON object conforming to the provided schema.
The case must have a root node, multiple decision paths, and at least one terminal node (a node with no options, or an option with next_node_index=None).
The case must strictly be for Higher Education / University level. No K-12 concepts.
"""

    if has_api_key:
        provider = get_provider()
        raw_output = await provider.generate_structured(
            prompt=prompt,
            schema=CASE_GENERATION_JSON_SCHEMA,
            system_prompt=system_prompt,
        )
        # Validate through Pydantic model
        case_output = CaseGenerationOutput(**raw_output)
    else:
        # Mock / Test mode
        logger.info("generate_case_mock_mode")
        case_output = CaseGenerationOutput(
            title="Mock University Case",
            description="This is a mock generated case for testing.",
            root_node_index=0,
            nodes=[
                {
                    "situation": "This is the initial situation for the university case.",
                    "options": [
                        {
                            "text": "Choose path A",
                            "consequence": "Consequence for path A.",
                            "next_node_index": 1
                        },
                        {
                            "text": "Choose path B",
                            "consequence": "Consequence for path B.",
                            "next_node_index": None
                        }
                    ]
                },
                {
                    "situation": "This is the second situation.",
                    "options": []
                }
            ]
        )
        
    # Serialize nodes
    serialized_nodes = [node.model_dump() for node in case_output.nodes]
    
    return CaseGenerationResponse(
        title=case_output.title,
        description=case_output.description,
        root_node_index=case_output.root_node_index,
        nodes=serialized_nodes,
        source_chunks=source_chunk_ids
    )
