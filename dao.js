const mongodb = require("mongodb");
const uri = "mongodb+srv://"+process.env.DBUSER+":"+process.env.DBPASS+"@cluster0."+process.env.DBROUTE+".mongodb.net?retryWrites=true&w=majority";

class DAO {
    constructor() {
        this.client = new mongodb.MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        this.client
            .connect()
            .then(() => {
                // will only create collection if it doesn't exist
                return this.client.db("SocialSight").collection("questions");
            })
            .then(__collection => {
                // store reference to collection
                console.log("DB Connection Success")
                this.questionsCollection = __collection;
            });
    }
    getQuestion(questionTag) {
        return this.questionsCollection.findOne( {_id: questionTag} );
    }
    getAllQuestions() {
        return this.questionsCollection.find();
    }
    getQuestionsForMedia(mediaText) {
        return this.questionsCollection.find( {mediaText: mediaText} );
    }
    getQuestionsForMediaAndHumanTag(mediaText, human) {
        return this.questionsCollection.find( {mediaText: mediaText, human: human} );
    }
}

exports.DAO = DAO;