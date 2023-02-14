import pandas as pd
from pymongo import MongoClient
from dotenv import dotenv_values


def question_to_scale(question):
    match question:
        case "C1" | "C2" | "C3" | "C6" | "D1" | "D5" | "D6" | "D7" | "D8" | "A3" | "A4":
            return ["Very Frequently", "Frequently", "Occasionally", "Rarely", "Very Rarely", "Never"]
        case "A2":
            return ["No Ads", "Strongly Agree", "Agree", "Slightly Agree", "Slightly Disagree", "Disagree", "Strongly Disagree"]
        case "D3":
            return ["Video", "Image", "Text", "No Priority"]
        case "D2":
            return ["<10 Min", "~30 Min", "~1 Hr", ">1 Hr"]
        case _:
            return ["Strongly Agree", "Agree", "Slightly Agree", "Slightly Disagree", "Disagree", "Strongly Disagree"]


def reverse_tag(question):
    match question:
        case "C2" | "C5" | "D7" | "D8" | "A4":
            return "reverse"
        case "D2" | "D3":
            return "info"
        case "C3":
            return "CtoD"
        case "A2":
            return "ad"
        case _:
            return False


# Setup MySQL.
config = dotenv_values(".env")

mongodb_client = MongoClient(config["ATLAS_URI"])
database = mongodb_client[config["DB_NAME"]]
collection = database[config["COLLECTION_NAME"]]

csvQuestionData = pd.read_table('MQPSocialMediaResponses.csv', sep=',', quotechar='"')
media = ["Twitter", "Instagram", "Reddit", "Tumblr", "Tik Tok", "BeReal", "YouTube", "Snapchat", "Facebook", "4Chan",
         "LinkedIn", "Twitch"]
cleanQuestionData = []

startIndex = 20
numberOfQuestions = 26
numberOfMedia = 12
for questionIndex in range(numberOfQuestions):
    columnIndex = startIndex + questionIndex * numberOfMedia
    # Question title is in row 0, at the current question column, without the ' - Twitter' suffi
    questionText = csvQuestionData.iloc[0][columnIndex][:-10]
    for mediaIndex in range(numberOfMedia):
        mediaText = csvQuestionData.iloc[0][columnIndex + mediaIndex][len(questionText) + 3:]
        # Get the header string to index the data
        questionExportTag = csvQuestionData.columns[columnIndex + mediaIndex]

        # Get the data for this question without nulls
        rawQuestionData = csvQuestionData[csvQuestionData[questionExportTag].notnull()].iloc[2:][
            questionExportTag].astype(int)
        arrQuestionData = rawQuestionData.sort_values().values.tolist()

        # Calculate Other Helpful Values
        total = rawQuestionData.size
        letterTag = questionExportTag[0]

        questionObject = {
            "_id": questionExportTag,
            "qTag": questionExportTag[:2],
            "title": questionText,
            "mediaText": mediaText,
            "human": letterTag,
            "total": total,
            "points": arrQuestionData,
            "scale": question_to_scale(questionExportTag[:2]),
            "reverseTag": reverse_tag(questionExportTag[:2])
        }
        print(questionObject)
        cleanQuestionData.append(questionObject)
        # Using update_one() method for single update
        collection.update_one({"_id": questionExportTag}, {"$set": questionObject})
