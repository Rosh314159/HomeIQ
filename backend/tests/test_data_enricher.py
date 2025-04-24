def test_data_enricher():
    assert data_enricher_function(input_data) == expected_output

def test_edge_case():
    assert data_enricher_function(edge_case_input) == edge_case_expected_output