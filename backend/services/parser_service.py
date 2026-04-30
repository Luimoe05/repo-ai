from tree_sitter import Language, Parser
import tree_sitter_python as tspython
import tree_sitter_javascript as tsjavascript
import tree_sitter_typescript as tstypescript

CHUNK_NODES: dict = {
    ".py":  {"function_definition", "class_definition"},
    ".js":  {"function_declaration", "class_declaration", "export_statement", "lexical_declaration"},
    ".jsx": {"function_declaration", "class_declaration", "export_statement", "lexical_declaration"},
    ".ts":  {"function_declaration", "class_declaration", "export_statement", "lexical_declaration"},
    ".tsx": {"function_declaration", "class_declaration", "export_statement", "lexical_declaration"},
}


def _build_parsers() -> dict[str, Parser]:
    parsers = {}
    for ext, (module, attr) in {
        ".py":  (tspython,     "language"),
        ".js":  (tsjavascript, "language"),
        ".jsx": (tsjavascript, "language"),
        ".ts":  (tstypescript, "language_typescript"),
        ".tsx": (tstypescript, "language_tsx"),
    }.items():
        lang = Language(getattr(module, attr)())
        p = Parser(lang)
        parsers[ext] = p
    return parsers


PARSERS: dict[str, Parser] = _build_parsers()
