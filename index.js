import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  database: "todo",
  host: "localhost",
  password: "THISISPRIVATE",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

async function getData() {
  const result = await db.query("SELECT * FROM item ORDER BY id ASC");
  result.rows.forEach((item => {
    items.push(item);
  }));
}
getData();

async function addNew(input) {
  try {
    await db.query("INSERT INTO item (title)  VALUES ($1)", [input]);
  } catch (error) {
    console.log('Error', error.message);
  }
}

app.get("/", async (req, res) => {
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  items.push({ title: item });
  await addNew(item);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId;
  const data = req.body.updatedItemTitle;
  const result = await db.query(
    "UPDATE item SET title = ($1) WHERE ID = $2",
    [data, id]
  );
  items = [];
  await getData();
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  try {
    const id = req.body.deleteItemId;
    await db.query("DELETE FROM item WHERE id = $1", [id]);
    items = [];
    await getData();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
