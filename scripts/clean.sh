#!/bin/bash

if [[ "$1" == "all" ]]; then
	rm -rf ~/.npm
	rm -rf ~/.nvm
	rm -rf node_modules
	rm -rf build coverage logs downloads	
else
	rm -rf build coverage logs downloads	
fi
