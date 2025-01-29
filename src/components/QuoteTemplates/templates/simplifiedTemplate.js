export const simplifiedTemplate = {
      name: "Simplified Audit Template",
      content: `<!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .damage-photo img {
            max-width: 400px;
            max-height: 250px;
            width: auto;
            height: auto;
            object-fit: contain;
            margin: 10px auto;
            display: block;
          }
        </style>
      </head>
      <body>
        <h1>Mezzanine Floor Audit</h1>
        <p>Reference: {{reference_number}}</p>
        <p>Date: {{audit_date}}</p>
        <p>Auditor: {{auditor_name}}</p>
        <p>Site: {{site_name}}</p>
        <p>Company: {{company_name}}</p>
        <p>Notes: {{notes}}</p>

        <h2>Damage Records</h2>
        {{#each damage_records}}
          <div class="damage-record">
            <h3>{{damage_type}}</h3>
            <p>Location: {{location_details}}</p>
            <p>Recommendation: {{recommendation}}</p>
            {{#if photo_url}}
              <div class="damage-photo">
                <img src="{{photo_url}}" alt="Damage" />
              </div>
            {{/if}}
          </div>
        {{/each}}
      </body>
      </html>`
    };
