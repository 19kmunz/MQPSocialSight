import numpy as np


class Question:
    def __init__(self, question, arr):
        self.question = question
        self.media = arr[1]
        self.veryFrequently = arr[3]
        self.frequently = arr[5]
        self.occasionally = arr[7]
        self.rarely = arr[9]
        self.veryRarely = arr[11]
        self.never = arr[13]
        self.total = arr[14]

    def __str__(self):
        return "Question: % s \nMedia: % s\nVF:% s, F:% s, O:% s, R:% s, VR:% s, N:% s\nTotal:% s" % (
            self.question, self.media, self.veryFrequently, self.frequently, self.occasionally, self.rarely,
            self.veryRarely, self.never, self.total)

    def toArray(self):
        return np.concatenate((np.repeat(6, self.veryFrequently), np.repeat(5, self.frequently),
                         np.repeat(4, self.occasionally), np.repeat(3, self.rarely),
                         np.repeat(2, self.veryRarely), np.repeat(1, self.never)))

#for question in range(26):
    #for media in range(12):


# using loadtxt()
question = np.loadtxt("MQPReport.csv",
                      delimiter=",", dtype=str, skiprows=48, max_rows=1, quotechar='"')
arr = np.loadtxt("MQPReport.csv",
                 delimiter=",", dtype=str, skiprows=64, max_rows=12)
twitter = Question(question, arr[0])
twitterArray = twitter.toArray()
print(twitterArray)
min = np.amin(twitterArray)
max = np.amax(twitterArray)
median = np.median(twitterArray)
q3, q1 = np.percentile(twitterArray, [75, 25])
iqr = q3 - q1
print(min)
print(max)
print(median)
print(q1)
print(q3)
print(iqr)

# ['1' 'Twitter' '2.33%' '1' '51.16%' '22' '32.56%' '14' '9.30%' '4' '4.65%' '2' '0.00%' '0' '43']
# ['2' 'Instagram' '14.29%' '10' '35.71%' '25' '27.14%' '19' '14.29%' '10' '7.14%' '5' '1.43%' '1' '70']
