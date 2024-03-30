from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine, OperatorConfig
from presidio_anonymizer.operators import Operator, OperatorType

from typing import Dict
import re


class InstanceCounterAnonymizer(Operator):
    """
    Anonymizer which replaces the entity value
    with an instance counter per entity.
    """

    REPLACING_FORMAT = "<PII_{index}>"

    def operate(self, text: str, params: Dict = None) -> str:
        """Anonymize the input text."""

        entity_mapping: Dict[str] = params["entity_mapping"]

        if text in entity_mapping:
            return entity_mapping[text]

        previous_index = self._get_last_index(entity_mapping)
        new_text = self.REPLACING_FORMAT.format(index=previous_index + 1)

        entity_mapping[text] = new_text
        return new_text

    @staticmethod
    def _get_last_index(entity_mapping: Dict) -> int:
        """Get the last index for a given entity type."""
        return len(entity_mapping) - 1

    def validate(self, params: Dict = None) -> None:
        """Validate operator parameters."""

        if "entity_mapping" not in params:
            raise ValueError("An input Dict called `entity_mapping` is required.")
        if "entity_type" not in params:
            raise ValueError("An entity_type param is required.")

    def operator_name(self) -> str:
        return "entity_counter"

    def operator_type(self) -> OperatorType:
        return OperatorType.Anonymize


class PresidioTask:
    def __init__(self):
        self.analyzer = AnalyzerEngine()
        self.anonymizer = AnonymizerEngine()
        self.anonymizer.add_anonymizer(InstanceCounterAnonymizer)

    def _analyze(self, text: str) -> Dict:
        return self.analyzer.analyze(text, language="en")
    
    def anonymize(self, text: str) -> Dict:
        entity_mapping = {}
        analyzer_results = self._analyze(text)
        results = self.anonymizer.anonymize(
            text,
            analyzer_results,
            {
                "DEFAULT": OperatorConfig(
                    "entity_counter", {"entity_mapping": entity_mapping}
                )
            },
        )
        return results.text, entity_mapping
    
    def deanonymize(self, text: str, entity_mapping: Dict) -> str:
        # replace the entity values with the original values
        reversed_mapping = {v: k for k, v in entity_mapping.items()}
        self.pattern = re.compile("PII_(\d+)")
        def replace(match):
            name = f"<{match.group(0)}>"
            return reversed_mapping[name]
        result = self.pattern.sub(replace, text)
        return result.replace("<", "").replace(">", "")

# task = PresidioTask()
# task.clear_entity_mapping()
# text = "My name is Alice and I live in Wonderland."
# anonymized_text = task.anonymize(text)
# print(anonymized_text.text)
# deanonymized_text = task.deanonymize(anonymized_text.text)
# print(deanonymized_text)