export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container flex h-16 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Auto Insights. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
