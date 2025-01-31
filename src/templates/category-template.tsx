import React, { type FC } from "react";
import { graphql } from "gatsby";

import { Feed } from "@/components/feed";
import { Meta } from "@/components/meta";
import { Page } from "@/components/page";
import { Layout } from "@/components/layout";
import { Sidebar } from "@/components/sidebar";
import { Pagination } from "@/components/pagination";
import { useSiteMetadata } from "@/hooks/use-site-metadata";
import type { AllMarkdownRemark } from "@/types/all-markdown-remark";
import type { PageContext } from "@/types/page-context";

interface CategoryTemplateProps {
  data: {
    allMarkdownRemark: AllMarkdownRemark;
  };
  pageContext: PageContext;
}

const CategoryTemplate: FC<CategoryTemplateProps> = ({ data, pageContext }) => {
  const { group, pagination } = pageContext;
  const { prevPagePath, nextPagePath, hasPrevPage, hasNextPage } = pagination;

  const { edges } = data.allMarkdownRemark;
  const { title: siteTitle, description: siteDescription } = useSiteMetadata();

  return (
    <Layout>
      <Sidebar />
      <Page title={group}>
        {/*
          Pass the category in so Feed can check if `category === 'reading'`.
          If your category is strictly lowercase "reading" in frontmatter,
          this will match exactly.
        */}
        <Feed edges={edges} category={group} />
        <Pagination
          prevPagePath={prevPagePath}
          nextPagePath={nextPagePath}
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
        />
      </Page>
    </Layout>
  );
};

export const query = graphql`
  query CategoryTemplate($group: String, $limit: Int!, $offset: Int!) {
    allMarkdownRemark(
      limit: $limit
      skip: $offset
      filter: {
        frontmatter: {
          category: { eq: $group }
          template: { eq: "post" }
          draft: { ne: true }
        }
      }
      sort: { frontmatter: { date: DESC } }
    ) {
      edges {
        node {
          fields {
            slug
            categorySlug
          }
          frontmatter {
            description
            category
            title
            date
            slug
          }
        }
      }
    }
  }
`;

export const Head: FC<CategoryTemplateProps> = ({ pageContext }) => {
  const { title, description } = useSiteMetadata();
  const {
    group,
    pagination: { currentPage: page },
  } = pageContext;

  const pageTitle =
    page > 0 ? `${group} - Page ${page} - ${title}` : `${group} - ${title}`;

  return <Meta title={pageTitle} description={description} />;
};

export default CategoryTemplate;
