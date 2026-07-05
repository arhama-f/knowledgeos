export function MarketingFooter() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded text-[10px] font-bold">
                K
              </div>
              <span className="font-semibold">KnowledgeOS</span>
            </div>
            <p className="text-muted-foreground mt-3 max-w-xs text-sm leading-relaxed">
              The enterprise AI knowledge platform. Upload your documents, give your team instant
              cited answers.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium">Product</h4>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <a
                  href="/#features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/sign-up"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Get started
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium">Company</h4>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <a
                  href="mailto:hello@knowledgeos.ai"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact us
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@knowledgeos.ai?subject=Enterprise%20inquiry"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Enterprise sales
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} KnowledgeOS. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Built for the enterprise. Priced for growth.
          </p>
        </div>
      </div>
    </footer>
  );
}
