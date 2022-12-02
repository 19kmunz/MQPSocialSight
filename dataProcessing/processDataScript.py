import numpy as np
import pandas as pd


csvQuestionData = pd.read_table('MQPSocialMediaResponses.csv', sep=',', quotechar='"')
media = ["Twitter", "Instagram", "Reddit", "Tumblr", "Tik Tok", "BeReal", "YouTube", "Snapchat", "Facebook", "4Chan",
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
        print(questionExportTag)

        # Get the data for this question without nulls
        rawQuestionData = csvQuestionData[csvQuestionData[questionExportTag].notnull()].iloc[2:][questionExportTag].astype(int)

        # Calculate Box Plot Info
        min = np.amin(rawQuestionData)
        max = np.amax(rawQuestionData)
        median = np.median(rawQuestionData)
        q3, q1 = np.percentile(rawQuestionData, [75, 25], method='midpoint')
        iqr = q3 - q1
        print(min, q1, median, q3, max, iqr)
        if not q1.is_integer() or not q3.is_integer():
            print(rawQuestionData.array)

        # Calculate Other Helpful Values
        total = rawQuestionData.size
        letterTag = questionExportTag[0]
        numberTag = questionExportTag[0:questionExportTag.index("_")]

        questionObject = {
            "questionExportTag": questionExportTag,
            "questionText": questionText,
            "mediaText": mediaText,
            "min": min,
            "q1": q1,
            "median": median,
            "q3": q3,
            "max": max,
            "iqr": iqr,
            "total": total,
            "letterTag" : letterTag,
            "numberTag": numberTag
        }
        # Add data for this question to data for the dataframe
        cleanQuestionData.append(questionObject)

# Creates DataFrame.
df = pd.DataFrame(cleanQuestionData)
df.set_index("questionExportTag", inplace=True, verify_integrity=True)

df.to_csv("MQPCleanData.csv")

# print(data.C1_1[2:].min())
