import type { Octokit } from 'octokit';

import type { GithubCommentTarget, GithubPullRequestCommentTarget } from './types';

export interface PostGithubCommentOptions {
  body: string;
}

export function postIssueComment(
  octokit: Octokit,
  target: GithubCommentTarget,
  { body }: PostGithubCommentOptions,
) {
  return octokit.rest.issues.createComment({
    owner: target.owner,
    repo: target.repo,
    issue_number: target.issueNumber,
    body,
  });
}

export function postPullRequestComment(
  octokit: Octokit,
  target: GithubPullRequestCommentTarget,
  { body }: PostGithubCommentOptions,
) {
  return octokit.rest.issues.createComment({
    owner: target.owner,
    repo: target.repo,
    issue_number: target.pullNumber,
    body,
  });
}

export function postRepositoryComment(
  octokit: Octokit,
  target: GithubCommentTarget | GithubPullRequestCommentTarget,
  options: PostGithubCommentOptions,
) {
  if ('issueNumber' in target) {
    return postIssueComment(octokit, target, options);
  }

  return postPullRequestComment(octokit, target, options);
}
