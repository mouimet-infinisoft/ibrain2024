// components/BreadcrumbComponent.tsx
"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

// Placeholder function to simulate a database lookup for GUIDs
function fetchNameForGuid(guid: string): string {
  const simulatedDatabase: Record<string, string> = {
    "123e4567-e89b-12d3-a456-426614174000": "Sample Item 1",
    "987f6543-b21a-32e1-c987-124351476531": "Sample Item 2",
  };
  return simulatedDatabase[guid] || "Conversation";
}

// Define a mapping to replace known segments with meaningful names
const segmentMapping: Record<string, string> = {
  home: "Home",
  chat: "Chat",
  models: "Models",
  documentation: "Documentation",
  settings: "Settings",
  // Add more mappings as needed
};

interface BreadcrumbData {
  name: string;
  href: string;
}

const BreadcrumbComponent: React.FC = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment);

  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbData[]>([]);

  useEffect(() => {
    const generateBreadcrumbItems = () => {
      const items: BreadcrumbData[] = [];

      // Add "Home" as the first breadcrumb if the path includes "/protected"
      if (pathSegments[0] === "protected") {
        items.push({ name: "Home", href: "/protected" });
      }

      // Iterate through segments, starting after "protected" if present
      pathSegments
        .slice(pathSegments[0] === "protected" ? 1 : 0)
        .forEach((segment, index) => {
          // Check if the segment is mapped in segmentMapping
          const mappedName = segmentMapping[segment];

          // Detect if the segment is a GUID
          const isGuid =
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
              segment
            );
          let name = mappedName || segment; // Default to segment name if no mapping exists

          // Fetch a meaningful name if it's a GUID
          if (isGuid) {
            name = fetchNameForGuid(segment);
          }

          items.push({
            name,
            href: `/protected/${pathSegments.slice(1, index + 2).join("/")}`,
          });
        });

      setBreadcrumbItems(items);
    };

    generateBreadcrumbItems();
  }, []);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbComponent;
