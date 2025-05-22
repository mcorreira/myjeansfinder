export default async () => ({
  projects: await getJestProjectsAsync(),
});
