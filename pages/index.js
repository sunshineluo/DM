import Layout from "@/components/Layout"
import Search from "../components/Search"

export default function Home({ playlist, singer }) {
  return (
    <div className="font-mono">
      /login
      /dashboard
      /search
    </div>
  )
}

export async function getStaticProps() {
  // Call an external API endpoint to get posts.
  // You can use any data fetching library
  const list = await fetch('https://cf233.eu.org/top/playlist/highquality');
  const singers = await fetch('https://cf233.eu.org/artist/list');
  const playlist = await list.json();
  const singer = await singers.json();

  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      playlist,
      singer,
    },
  };
}