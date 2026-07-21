import { LegalConsentProvider } from "./contexts/LegalConsentContext";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { createDemoStudioPreview } from "./data/demoStudio";
import { FaqPage } from "./pages/FaqPage";
import { HomePage } from "./pages/HomePage";
import { LegalPage } from "./pages/LegalPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { StudioCrmPreviewPage } from "./pages/StudioCrmPreviewPage";
import { StudioProfilePage } from "./pages/StudioProfilePage";
import { StudiosDirectoryPage } from "./pages/StudiosDirectoryPage";
import { TrialPage } from "./pages/TrialPage";
import { studioRegistry } from "./pages/studios";
import { ThemedStudioPage } from "./pages/studios/ThemedStudioPage";
import { useSiteLocation } from "./utils/siteRouter";
import { useScrollReveal } from "./utils/useScrollReveal";

function getPageFromPath(pathname) {
  if (pathname === "/") {
    return {
      currentPath: pathname,
      element: <HomePage />
    };
  }

  if (pathname === "/studios") {
    return {
      currentPath: pathname,
      element: <StudiosDirectoryPage />
    };
  }

  if (pathname === "/faq") {
    return {
      currentPath: pathname,
      element: <FaqPage />
    };
  }

  // Fokuserad landningssida för trial-trafik (Instagram-bio m.m.) —
  // headern döljs så att sidans enda CTA inte konkurrerar med navigationen.
  if (pathname === "/testa-gratis") {
    return {
      currentPath: pathname,
      element: <TrialPage />,
      hideHeader: true
    };
  }

  // Egna rutter, inte bara modalen: Googles OAuth-verifiering kräver att
  // integritetspolicyn går att öppna direkt på sin URL.
  if (pathname === "/integritetspolicy") {
    return {
      currentPath: pathname,
      element: <LegalPage document="privacy" />
    };
  }

  if (pathname === "/anvandarvillkor") {
    return {
      currentPath: pathname,
      element: <LegalPage document="terms" />
    };
  }

  if (pathname === "/studio-crm-preview") {
    return {
      currentPath: "/studios",
      element: <StudioCrmPreviewPage />
    };
  }

  const studioPreviewMatch = pathname.match(/^\/studio-preview(?:\/([^/]+))?$/);

  if (studioPreviewMatch) {
    const submitSlug = studioPreviewMatch[1] ? decodeURIComponent(studioPreviewMatch[1]) : "";

    return {
      currentPath: "/studios",
      element: (
        <StudioProfilePage
          previewMode
          studioOverride={createDemoStudioPreview({ submitSlug })}
        />
      )
    };
  }

  const studioMatch = pathname.match(/^\/studio\/([^/]+)$/);

  if (studioMatch) {
    const slug = decodeURIComponent(studioMatch[1]);
    const entry = studioRegistry[slug];
    return {
      currentPath: pathname,
      element: entry
        ? <ThemedStudioPage slug={slug} theme={entry.theme} />
        : <StudioProfilePage slug={slug} />
    };
  }

  return {
    currentPath: pathname,
    element: <NotFoundPage />
  };
}

function AppContent() {
  const location = useSiteLocation();
  const page = getPageFromPath(location.pathname);

  useScrollReveal();

  return (
    <div>
      {!page.hideHeader && <SiteHeader currentPath={page.currentPath} />}
      <main>{page.element}</main>
      <SiteFooter />
    </div>
  );
}

export default function App() {
  return (
    <LegalConsentProvider>
      <AppContent />
    </LegalConsentProvider>
  );
}
