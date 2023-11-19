
default: help

help: 			## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | gawk 'match($$0, /(makefile:)?(.*):.*?## (.*)/, a) {printf "\033[36m%-30s\033[0m %s\n", a[2], a[3]}'

install: 		## Install script in pokeclicker client
	@mkdir -p ~/.config/pokeclicker-desktop/scripts
	@cp -R scripts/ ~/.config/pokeclicker-desktop/
