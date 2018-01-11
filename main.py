from flask import Flask, render_template

app = Flask("lumenaut")
app.secret_key = '\xdbc\xbe\x9bGJ\xdd\x8fS*\xa7X!\xfd\x90_\xba\x17e\xd4\xcfp)X'

@app.route("/index")
@app.route("/")
def hello():
	return render_template("index.html", contributing_accounts=1234, total_votes=1)

if __name__ == "__main__":
	app.run()