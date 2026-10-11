export type ClientSuggestion = {
  id: string;
  org_name: string;
  address: string | null;
  contact_name: string | null;
  primary_contact_email: string | null;
  aliases: string[];
};
