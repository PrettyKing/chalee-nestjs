export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    clone_url: string;
    ssh_url: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    private: boolean;
    fork: boolean;
}

export interface GitHubApiResponse {
    repos: GitHubRepo[];
    total_count: number;
    page: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
}