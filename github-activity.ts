interface GithubActivityEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    display_login: string;
    gravatar_id: string;
    url: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: {
    repository_id?: number;
    push_id?: number;
    size?: number;
    distinct_size?: number;
    ref?: string;
    head?: string;
    before?: string;
    commits?: Array<{
      sha: string;
      author: {
        email: string;
        name: string;
      };
      message: string;
      distinct: boolean;
      url: string;
    }>;
    action?: string;
    issue?: {
      title: string;
    };
    ref_type?: string;
    forkee?: any;
    release?: {
      name: string;
    };
    sponsor?: string;
  };
  public: boolean;
  created_at: string;
}

const fetchGithubActivity = async (username: string) => {
  const response = await fetch(
    `https://api.github.com/users/${username}/events`
  );
  const data = (await response.json()) as GithubActivityEvent[];
  return data;
};

const bootstrap = async () => {
  const args = process.argv.slice(2);

  const [username] = args;

  if (!username) {
    console.error("Error: Username is required");
    console.error("Usage: node main.js <username>");
    process.exit(1);
  }

  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) {
    console.error("Error: Invalid username");
    process.exit(1);
  }

  let data: GithubActivityEvent[] = [];
  try {
    data = await fetchGithubActivity(username);
  } catch (error) {
    console.error("Error: Unable to fetch data");
    process.exit(1);
  }

  for (const event of data) {
    const {
      type,
      repo,
      payload: { commits, action, issue, ref_type, forkee, release, sponsor },
    } = event;

    const commitCount = commits?.length;

    const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

    switch (type) {
      case "PushEvent":
        console.log(`- Pushed ${commitCount} commits to ${repo.name}`);
        break;
      case "IssuesEvent":
        console.log(
          `- ${capitalize(action)} an issue in ${repo.name} - ${issue?.title}`
        );
        break;
      case "WatchEvent":
        console.log(`- Starred ${repo.name}`);
        break;
      case "CreateEvent":
        console.log(`- Created ${ref_type} in ${repo.name}`);
        break;
      case "DeleteEvent":
        console.log(`- Deleted ${ref_type} in ${repo.name}`);
        break;
      case "ForkEvent":
        console.log(`- Forked ${repo.name} to ${forkee}`);
        break;
      case "GollumEvent":
        console.log(`- Updated wiki in ${repo.name}`);
        break;
      case "IssueCommentEvent":
        console.log(`- Commented on issue in ${repo.name}`);
        break;
      case "MemberEvent":
        console.log(`- Added member to ${repo.name}`);
        break;
      case "PublicEvent":
        console.log(`- Made ${repo.name} public`);
        break;
      case "PullRequestEvent":
        console.log(`- ${capitalize(action)} pull request in ${repo.name}`);
        break;
      case "PullRequestReviewEvent":
        console.log(`- Reviewed pull request in ${repo.name}`);
        break;
      case "PullRequestReviewCommentEvent":
        console.log(`- Commented on pull request review in ${repo.name}`);
        break;
      case "PullRequestReviewThreadEvent":
        console.log(`- Threaded review comment in ${repo.name}`);
        break;
      case "ReleaseEvent":
        console.log(`- Released ${release?.name} in ${repo.name}`);
        break;
      case "SponsorshipEvent":
        console.log(`- Sponsored ${sponsor} in ${repo.name}`);
        break;
      default:
        console.log(`- ${type}`);
    }
  }
};

bootstrap();
