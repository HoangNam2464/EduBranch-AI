"""
EduBranch AI — Case Generation Service.
"""
import uuid
from typing import Any

from app.core.config import settings
from app.core.logging import logger
from app.providers.factory import get_provider, local_demo_active
from app.generation.demo_case import build_demo_case
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

    # 2. Real generation needs an API key; otherwise build an offline demo case from the context
    has_api_key = not local_demo_active()  # get_provider() raises in production without a key

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
The case must focus on experiential problem-solving, critical reasoning, and practical decision-making scenarios suitable for professional and higher-level learners.
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
        logger.info("generate_case_local_demo_mode")
        case_output = CaseGenerationOutput(**build_demo_case(query, [c.text for c in chunks]))

    # Serialize nodes
    serialized_nodes = [node.model_dump() for node in case_output.nodes]
    
    return CaseGenerationResponse(
        title=case_output.title,
        description=case_output.description,
        root_node_index=case_output.root_node_index,
        nodes=serialized_nodes,
        source_chunks=source_chunk_ids
    )
