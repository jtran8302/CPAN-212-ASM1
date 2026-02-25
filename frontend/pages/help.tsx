// help page — reference information for using the system
// shows CSV template format, status definitions, and allowed transitions
// this page is static — no API calls

export default function HelpPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* CSV template section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">CSV Upload Format</h3>
        <p className="text-sm text-gray-600 mb-3">
          When uploading work orders via CSV, the file must have these columns in the header row:
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded p-4 font-mono text-xs overflow-x-auto">
          <p>title,description,department,priority,requesterName,assignee</p>
        </div>
        <p className="text-sm text-gray-600 mt-3 mb-2">Example rows:</p>
        <div className="bg-gray-50 border border-gray-200 rounded p-4 font-mono text-xs overflow-x-auto">
          <p>Fix HVAC unit,HVAC unit in building 3 is not working properly,FACILITIES,HIGH,John Smith,Jane Doe</p>
          <p>Network outage,Network connectivity issue in floor 2 office,IT,MEDIUM,Alice Johnson,Bob Lee</p>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          The assignee column is optional — leave it blank if not assigned yet.
          Template and sample files are in the csv-templates/ folder of the repo.
        </p>
      </section>

      {/* field requirements */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Field Requirements</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-2">Field</th>
                <th className="px-4 py-2">Required</th>
                <th className="px-4 py-2">Rules</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              <tr><td className="px-4 py-2 font-medium">title</td><td className="px-4 py-2">Yes</td><td className="px-4 py-2">Minimum 5 characters</td></tr>
              <tr><td className="px-4 py-2 font-medium">description</td><td className="px-4 py-2">Yes</td><td className="px-4 py-2">Minimum 10 characters</td></tr>
              <tr><td className="px-4 py-2 font-medium">department</td><td className="px-4 py-2">Yes</td><td className="px-4 py-2">FACILITIES, IT, SECURITY, or HR</td></tr>
              <tr><td className="px-4 py-2 font-medium">priority</td><td className="px-4 py-2">Yes</td><td className="px-4 py-2">LOW, MEDIUM, or HIGH</td></tr>
              <tr><td className="px-4 py-2 font-medium">requesterName</td><td className="px-4 py-2">Yes</td><td className="px-4 py-2">Minimum 3 characters</td></tr>
              <tr><td className="px-4 py-2 font-medium">assignee</td><td className="px-4 py-2">No</td><td className="px-4 py-2">Optional — who should work on this</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* status definitions */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Status Definitions</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium w-28 text-center shrink-0">NEW</span>
            <p className="text-gray-600">Just submitted. Has not been picked up by anyone yet.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium w-28 text-center shrink-0">IN PROGRESS</span>
            <p className="text-gray-600">Assigned to someone and actively being worked on.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium w-28 text-center shrink-0">BLOCKED</span>
            <p className="text-gray-600">Something is preventing progress. Waiting on parts, approval, or external action.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium w-28 text-center shrink-0">DONE</span>
            <p className="text-gray-600">Resolved. No further action needed. Cannot be changed after this.</p>
          </div>
        </div>
      </section>

      {/* allowed transitions */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Allowed Status Transitions</h3>
        <p className="text-sm text-gray-600 mb-3">
          Work orders follow a strict lifecycle. You can only move to specific statuses from the current one:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">Allowed Next</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              <tr><td className="px-4 py-2 font-medium">NEW</td><td className="px-4 py-2">IN_PROGRESS</td></tr>
              <tr><td className="px-4 py-2 font-medium">IN_PROGRESS</td><td className="px-4 py-2">BLOCKED, DONE</td></tr>
              <tr><td className="px-4 py-2 font-medium">BLOCKED</td><td className="px-4 py-2">IN_PROGRESS</td></tr>
              <tr><td className="px-4 py-2 font-medium">DONE</td><td className="px-4 py-2">(none — final state)</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-4 font-mono text-xs">
          <p>NEW --&gt; IN_PROGRESS --&gt; DONE</p>
          <p>NEW --&gt; IN_PROGRESS --&gt; BLOCKED --&gt; IN_PROGRESS</p>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Trying to transition outside these paths returns a 409 Conflict error.
        </p>
      </section>
    </div>
  );
}
