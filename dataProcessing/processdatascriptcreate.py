import pandas as pd
from pymongo import MongoClient
from dotenv import dotenv_values

csvQuestionData = pd.read_table('MQPSocialMediaResponses.csv', sep=',', quotechar='"')
media = ["Twitter", "Instagram", "Reddit", "Tumblr", "TikTok", "BeReal", "YouTube", "Snapchat", "Facebook", "4Chan",
         "LinkedIn", "Twitch"]
cleanQuestionData = []

startIndex = 20
numberOfQuestions = 26
numberOfMedia = 12
for questionIndex in range(numberOfQuestions):
    columnIndex = startIndex + questionIndex*numberOfMedia
    # Question title is in row 0, at the current question column, without the ' - Twitter' suffi
    questionText = csvQuestionData.iloc[0][columnIndex][:-10]
    for mediaIndex in range(numberOfMedia):
        mediaText = csvQuestionData.iloc[0][columnIndex+mediaIndex][len(questionText)+3:]
        # Get the header string to index the data
        questionExportTag = csvQuestionData.columns[columnIndex + mediaIndex]

        # Get the data for this question without nulls
        rawQuestionData = csvQuestionData[csvQuestionData[questionExportTag].notnull()].iloc[2:][questionExportTag].astype(int)
        arrQuestionData = rawQuestionData.sort_values().values.tolist()

        # Calculate Other Helpful Values
        total = rawQuestionData.size
        letterTag = questionExportTag[0]

        questionObject = {
            "_id": questionExportTag,
            "qTag": questionExportTag,
            "title": questionText,
            "mediaText": mediaText,
            "human": letterTag,
            "total": total,
            "points": arrQuestionData
        }
        print(questionObject)
        # Add data for this question to data for the dataframe
        cleanQuestionData.append(questionObject)

# Creates DataFrame.
config = dotenv_values(".env")

mongodb_client = MongoClient(config["ATLAS_URI"])
database = mongodb_client[config["DB_NAME"]]
collection = database[config["COLLECTION_NAME"]]

result = collection.insert_many(cleanQuestionData)
