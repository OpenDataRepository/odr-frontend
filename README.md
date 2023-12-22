# Open Data Repository (ODR) Front-End

## Overarching Goal / Summary

ODR is fundamentally a database web application allowing a user with no technical knowledge to design a database and create records from it. It's an attempt to remove the need to hire a data scientist to set up an independent database for every project. A second, yet still primary goal of ODR is allow data formatting standards to emerge by allowing users to set up data formats (called templates in the code), make those formats/templates public, and then allow other users to create their own database of records using that data format.

## Back End 
This repo is intended to be the front end to a web application for flexible data creation and management. 
The back end which this repo is intended to use is https://github.com/OpenDataRepository/data-publisher-api
The last commmit on the back-end which was tested somewhat extensively with this repo is commit 982d9aac23dfcde2d6bb8337686ebe12059c887f. 

## Quick Start

### Testing
- npm test

### Running the Server
- follow instructions on the back-end repo to run the back-end
- Set the backend_url variable in environment.ts to match the url of the back-end
- ionic serve

## Workflow
The workflow fundamentally: create account -> create a dataset -> save the dataset -> persist the dataset -> create records for the dataset.

## TODOs
This project never got close to alpha mode. Work left to be done:
- Add tests. There are very few tests and functionality breaks with every change.
- Right now only a single view is supported per dataset. Multiple views should be supported and the user should be able to swap between them.
- Speed. Right now everything is very slow. Profiling should be done on the front-end and the back-end to improve speed.
- There are many other TODOs sprinkled throughout the code


## Contact Information

You can contact me on github or directly at calebshort4697@gmail.com if you have questions.
