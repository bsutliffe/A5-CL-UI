
a5.Package('a5.cl.ui.form')
	.Static('UIValidationStates', function(UIValidationStates){
		
		UIValidationStates.TOO_LONG = "Value exceeds the maximum length.";
		UIValidationStates.TOO_SHORT = "Value does not meet the minimum length requirement.";
		UIValidationStates.PATTERN_MISMATCH = "Value does not match the specified pattern.";
		UIValidationStates.REQUIRED = "This field is required.";
});
