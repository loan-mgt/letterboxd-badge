# Define the input and output files
INPUT = assets/main.svg
OUTPUT = ressources/source.js

# Build target
build:
	echo "const source = \`" > $(OUTPUT)
	cat $(INPUT) >> $(OUTPUT)
	echo "\`;" >> $(OUTPUT)
	echo "module.exports = { source };" >> $(OUTPUT)

# Clean target (optional)
clean:
	rm -f $(OUTPUT)
