"use client";

import { motion } from "framer-motion";
import { theme } from "@/config/theme";
import { SectionHeading } from "@/components/ui";

type PartnerCompany = {
  id: string;
  name: string;
  description: string;
  logo: string;
};

const partnerCompanies = theme.partners.companies as readonly PartnerCompany[];

export function CompanyPartners() {
  return (
    <section className="section bg-white" id="company-partners">
      <div className="container">
        <SectionHeading
          title="Companies We Work With"
          subtitle="A few of the organizations we support with responsive service, clear communication, and dependable on-site work."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {partnerCompanies.map((company, index) => (
            <motion.article
              key={company.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-3xl border border-[var(--border-light)] bg-[var(--bg-secondary)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex min-h-[90px] items-center justify-center rounded-2xl bg-white px-6 py-5 shadow-sm">
                <img
                  src={company.logo}
                  alt={`${company.name} company mark`}
                  className="max-h-14 w-auto"
                />
              </div>

              <div className="mt-5">
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                  {company.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {company.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CompanyPartners;
