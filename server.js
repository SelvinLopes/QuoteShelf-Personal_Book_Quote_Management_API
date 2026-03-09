//client
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "http://localhost:4000";

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to render the main page
app.get("/", async (req, res) => {
  try {
    const postsResponse = await axios.get(`${API_URL}/posts`);
    const foldersResponse = await axios.get(`${API_URL}/folders`);

    res.render("index.ejs", {
      posts: postsResponse.data,
      folders: foldersResponse.data,
      insideFolder: false
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });
  }
});

// Route to render the edit page
app.get("/new", (req, res) => {
  res.render("modify.ejs", {
    heading: "New Post",
    submit: "Create Post",
    createFolder: false,
    post: null,
    insideFolder: false
  });
});

//Challenge: inside folder upload post
app.get("/folder/:id/new", (req, res) => {
  res.render("modify.ejs", {
    heading: "Upload Post to Folder",
    submit: "Add Post",
    post: null,
    folderId: req.params.id,
    insideFolder: true,
    createFolder: false
  });
});

app.get("/folder", (req, res) => {
  res.render("modify.ejs", {
    heading: "Create Folder",
    createFolder: true,
    post: null
  });
});

//Challenge: inside folder
app.get("/folder/:id", async (req, res) => {
  const foldersRes = await axios.get(`${API_URL}/folders`);
  const folder = foldersRes.data.find(
    f => f.id === parseInt(req.params.id)
  );

  res.render("index.ejs", {
  posts: folder.posts || [],
  folders: [folder],
  insideFolder: true
  });
});


app.get("/edit/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${req.params.id}`);
    console.log(response.data);
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response.data,

      insideFolder: false,
      folderId: null
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Edit a post INSIDE a folder (render form)
app.get("/folder/:folderId/posts/edit/:postId", async (req, res) => {
  try {
    const foldersRes = await axios.get(`${API_URL}/folders`);
    const folder = foldersRes.data.find(
      f => f.id === parseInt(req.params.folderId)
    );

    if (!folder) {
      return res.status(404).send("Folder not found");
    }

    const post = folder.posts.find(
      p => p.id === parseInt(req.params.postId)
    );

    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: post,
      folderId: req.params.folderId,
      insideFolder: true,
      createFolder: false
    });
  } catch (error) {
    res.status(500).send("Error loading post for edit");
  }
});


// Create a new post
app.post("/api/posts", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/posts`, req.body);
    console.log(response.data);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});

// Create a new folder
app.post("/api/folder", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/folder`, req.body);
    console.log(response.data);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error creating folder" });
  }
});

// Forward post creation INSIDE a folder to API
app.post("/api/folder/:id/posts", async (req, res) => {
  try {
    await axios.post(
      `${API_URL}/folder/${req.params.id}/posts`,
      req.body
    );

    res.redirect(`/folder/${req.params.id}`);
  } catch (error) {
    res.status(500).send("Error saving post in folder");
  }
});
app.use(bodyParser.urlencoded({ extended: true }));

// Partially update a post
app.post("/api/posts/:id", async (req, res) => {
  console.log("called");
  try {
    const response = await axios.patch(
      `${API_URL}/posts/${req.params.id}`,
      req.body
    );
    console.log(response.data);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete a post
app.get("/api/posts/delete/:id", async (req, res) => {
  try {
    await axios.delete(`${API_URL}/posts/${req.params.id}`);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

// Delete a post INSIDE a folder
app.get("/api/folder/:folderId/posts/delete/:postId", async (req, res) => {
  try {
    await axios.delete(
      `${API_URL}/folder/${req.params.folderId}/posts/${req.params.postId}`
    );

    res.redirect(`/folder/${req.params.folderId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting post from folder" });
  }
});

// Update a post INSIDE a folder (forward to API)
app.post("/api/folder/:folderId/posts/:postId", async (req, res) => {
  try {
    await axios.patch(
      `${API_URL}/folder/${req.params.folderId}/posts/${req.params.postId}`,
      req.body
    );

    res.redirect(`/folder/${req.params.folderId}`);
  } catch (error) {
    res.status(500).send("Error updating post in folder");
  }
});


//delete a folder
app.get("/api/folder/delete/:id", async (req, res) => {
  try {
    await axios.delete(`${API_URL}/folder/delete/${req.params.id}`);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error deleting folder" });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
