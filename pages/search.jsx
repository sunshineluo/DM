import { useState } from "react";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const Form = styled.form`
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  padding: 12px 16px;
  margin-right: 8px;
  border-radius: 4px;
  border: 1px solid gray;
`;

const Button = styled.button`
  padding: 12px 16px;
  background-color: #1db954;
  border: none;
  border-radius: 4px;
  color: white;

  &:hover {
    cursor: pointer;
  }
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  padding: 12px 16px;
  border-bottom: 1px solid gray;
`;

const Search = () => {
  const [keywords, setKeywords] = useState("");
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState(null);

  const search = async () => {
    const { data } = await axios.get(`/api/search/${keywords}/${offset}`);
    setResult(data.result.songs);
  };

  const handleKeywordsChange = (e) => {
    setKeywords(e.target.value);
  };

  const handleOffsetChange = (e) => {
    setOffset(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    search();
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Input type="text" value={keywords} onChange={handleKeywordsChange} placeholder="Search" />
        <Input type="number" value={offset} onChange={handleOffsetChange} placeholder="Offset" />
        <Button type="submit">Search</Button>
      </Form>
      {result ? (
        <List>
          {result.map((song) => (
            <ListItem key={song.id}>
              <a href={`https://music.163.com/#/song?id=${song.id}`} target="_blank" rel="noreferrer">
                {song.name} - {song.artists.map((artist) => artist.name).join(", ")}
              </a>
            </ListItem>
          ))}
        </List>
      ) : <>failed!</>}
    </Container>
  );
};

export default Search;