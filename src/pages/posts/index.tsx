import { GetStaticProps } from "next";
import Head from "next/head";
import { getPrismicClient } from "../api/prismic/prismic";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";
import Link from "next/link";

import styles from "./styles.module.scss";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
  author: string;
  image: string;
};

interface PostsProps {
  posts: Post[];
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews </title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link href={`/posts/${post.slug}`} key={post.slug}>
              <a>
                <div>
                {/* <img src={post.image} alt='poster' /> */}
                <h4>{post.author}</h4>
                </div>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
                <time>{post.updatedAt}</time>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "publication")],
  );

  const posts = response.results.map((post) => {
    return {
      slug: post.uid,
      image: post.data.poster.url,
      author: post.data.author.find((aut) => aut.type === "heading1")
      ?.text ?? "",
      title: RichText.asText(post.data.title),
      excerpt:
        post.data.content.find((content) => content.type === "paragraph")
          ?.text ?? "",
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
    };
  });

  return {
    props: {
      posts,
    },
  };
};
