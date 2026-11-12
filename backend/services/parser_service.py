import threading

from tree_sitter import Language, Parser
import tree_sitter_python as tspython
import tree_sitter_javascript as tsjavascript
import tree_sitter_typescript as tstypescript

# Node types worth storing as their own vector. `decorated_definition` matters
# more than it looks: in tree-sitter-python a decorated function's top-level
# node is the decorator wrapper, not `function_definition`. Without it every
# FastAPI route, pytest fixture and @property in an ingested repo is invisible
# to structural chunking — including RepoAI's own endpoints.
CHUNK_NODES: dict = {
    ".py":  {"function_definition", "class_definition", "decorated_definition"},
    ".js":  {"function_declaration", "class_declaration", "export_statement",
             "lexical_declaration", "method_definition"},
    ".jsx": {"function_declaration", "class_declaration", "export_statement",
             "lexical_declaration", "method_definition"},
    ".ts":  {"function_declaration", "class_declaration", "export_statement",
             "lexical_declaration", "method_definition"},
    ".tsx": {"function_declaration", "class_declaration", "export_statement",
             "lexical_declaration", "method_definition"},
}

# Wrappers to unwrap when deciding what a node really is, and containers worth
# descending into when the node as a whole is too large to embed.
WRAPPER_NODES = {"export_statement", "decorated_definition"}
CONTAINER_NODES = {"class_definition", "class_declaration", "class_body", "block"}

_LANGUAGES = {
    ".py":  (tspython,     "language"),
    ".js":  (tsjavascript, "language"),
    ".jsx": (tsjavascript, "language"),
    ".ts":  (tstypescript, "language_typescript"),
    ".tsx": (tstypescript, "language_tsx"),
}


def _build_parsers() -> dict[str, Parser]:
    return {
        ext: Parser(Language(getattr(module, attr)()))
        for ext, (module, attr) in _LANGUAGES.items()
    }


# tree_sitter.Parser is not thread-safe, and ingestion now runs in FastAPI's
# threadpool rather than on the event loop. One parser set per thread.
_local = threading.local()


def get_parser(suffix: str) -> Parser:
    parsers = getattr(_local, "parsers", None)
    if parsers is None:
        parsers = _local.parsers = _build_parsers()
    return parsers[suffix]
