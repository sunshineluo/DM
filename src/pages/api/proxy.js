module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://music.gengyue.eu.org/");
  res.setHeader("Access-Control-Allow-Credentials", "true");
};
