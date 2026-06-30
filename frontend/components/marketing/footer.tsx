export function MarketingFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm sm:flex-row">
        <p>© {new Date().getFullYear()} KnowledgeOS. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="/pricing" className="hover:text-foreground">
            Pricing
          </a>
          <a href="mailto:hello@knowledgeos.ai" className="hover:text-foreground">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
