# Python Data Processing
This folder contains the Python scripts for updating the database and making a local version of the db.
## How to Update the Data
First, install pymongo, pandas, and dotenv
```pip install pymongo; pip install pandas; pip install python-dotenv;```

Next, get the .env file from an authorized user. Put it in the dataProcessing folder

Download the data as a csv from qualtrics in Data & Analysis > Export & Import > Export Data... > Make sure "Download All Fields" is checked and "Use Numeric Values" is selected. Rename this csv to "MQPSocialMediaResponses.csv" and move it into the dataProcessing folder.

Then run the desired script!

```python .\processDataScriptCreateLocal.py``` will update the MQPCleanData.csv file. This can be moved to public for local testing

```python .\processDataScriptCreate.py``` will create all the question data and send it to the db

```python .\processDataScriptUpdate.py``` will update the data in the database. **This is likely what you want.**
