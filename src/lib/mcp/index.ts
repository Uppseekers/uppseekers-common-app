import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import listUniversities from "./tools/list-universities";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "uppseekers-caa-mcp",
  title: "Uppseekers Common Admission App",
  version: "0.1.0",
  instructions:
    "Tools for the Uppseekers Common Admission App. Use `get_my_profile` to read the signed-in student's applicant profile, and `list_universities` to browse the internal university weightage catalog.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyProfile, listUniversities],
});
