import type { Metadata } from "next";

export const metadata: Metadata = { title: "Guidelines" };

export default function GuidelinesPage() {
  return (
    <main className="page-narrow">
      <div className="card">
        <h1 className="h1">Upload guidelines</h1>

        <p className="mt-3 prose-body">
          Raff exists to help students study smarter — not to violate university rules.
          Please read these guidelines before uploading any material.
        </p>

        <div className="mt-6 space-y-6">

          <div>
            <h2 className="font-semibold text-lg">
              ✅ Allowed
            </h2>

            <ul className="mt-2 space-y-1 prose-body">
              <li>• Your own notes</li>
              <li>• Assignments that have already been submitted and graded</li>
              <li>• Lab reports</li>
              <li>• Practice material shared publicly by instructors</li>
              <li>• Study guides you created</li>
              <li>• Older past papers that are openly circulated</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg text-rose-600">
              ❌ Not Allowed
            </h2>

            <ul className="mt-2 space-y-1 prose-body">
              <li>• Leaked exams or tests</li>
              <li>• Materials obtained through hacking or private course access</li>
              <li>• Copyrighted textbooks or paid solutions</li>
              <li>• Instructor-only documents</li>
              <li>• Anything that could get students or faculty in trouble</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              Moderation
            </h2>

            <p className="mt-2 prose-body">
              All uploads are reviewed by moderators. Content that violates these
              rules will be removed, and repeated violations may result in
              account suspension.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              When in doubt — don’t upload
            </h2>

            <p className="mt-2 prose-body">
              If you are unsure whether something is allowed, it probably isn’t.
              Raff prioritizes academic integrity and student safety.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}