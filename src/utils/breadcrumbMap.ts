
export const breadcrumbMap: Record<
  string,
  string | ((params: Record<string, string>) => string)
> = {
  "/": "Home",
  "/results": "Results",
  "/courses": "Courses",
  "/courses/:courseId": ({ courseId }) => `Course ${courseId}`,
  "/courses/:courseId/ca-marks": "CA Marks",
};
