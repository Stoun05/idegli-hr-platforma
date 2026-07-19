export default function EmployerRequestFields({ t, extra, resetValidation }) {
  return (
    <>
      <label>
        <span>{t.fields.company}</span>
        <input required name="company" autoComplete="organization" onChange={resetValidation} />
      </label>

      <label>
        <span>{extra.employerIndustry}</span>
        <select required name="industry" defaultValue="" onChange={resetValidation}>
          <option value="" disabled>{extra.employerIndustryPlaceholder}</option>
          {extra.employerIndustryOptions.map((option) => (
            <option value={option} key={option}>{option}</option>
          ))}
        </select>
      </label>

      <label>
        <span>{extra.employerContactRole}</span>
        <input required name="contactRole" onChange={resetValidation} />
      </label>

      <label>
        <span>{extra.employerWebsite}</span>
        <input name="website" type="url" placeholder="https://" onChange={resetValidation} />
      </label>

      <div className="form-section-label wide-field">
        <span>02</span>
        <strong>{extra.employerVacancySection}</strong>
      </div>

      <label>
        <span>{t.fields.vacancy}</span>
        <input required name="vacancy" onChange={resetValidation} />
      </label>

      <label>
        <span>{extra.employerHeadcount}</span>
        <input required name="headcount" type="number" min="1" max="100" defaultValue="1" onChange={resetValidation} />
      </label>

      <label>
        <span>{extra.employerLocation}</span>
        <input required name="location" onChange={resetValidation} />
      </label>

      <label>
        <span>{extra.employerWorkType}</span>
        <select required name="workType" defaultValue="" onChange={resetValidation}>
          <option value="" disabled>{extra.employerWorkTypePlaceholder}</option>
          {extra.employerWorkTypeOptions.map((option) => (
            <option value={option} key={option}>{option}</option>
          ))}
        </select>
      </label>

      <label>
        <span>{extra.employerExperience}</span>
        <select required name="requiredExperience" defaultValue="" onChange={resetValidation}>
          <option value="" disabled>{extra.employerExperiencePlaceholder}</option>
          {extra.employerExperienceOptions.map((option) => (
            <option value={option} key={option}>{option}</option>
          ))}
        </select>
      </label>

      <label>
        <span>{extra.employerEmploymentType}</span>
        <select required name="employmentType" defaultValue="" onChange={resetValidation}>
          <option value="" disabled>{extra.employerEmploymentPlaceholder}</option>
          {extra.employerEmploymentOptions.map((option) => (
            <option value={option} key={option}>{option}</option>
          ))}
        </select>
      </label>

      <label>
        <span>{extra.employerSalaryFrom}</span>
        <input name="salaryFrom" inputMode="numeric" onChange={resetValidation} />
      </label>

      <label>
        <span>{extra.employerSalaryTo}</span>
        <input name="salaryTo" inputMode="numeric" onChange={resetValidation} />
      </label>

      <label>
        <span>{extra.employerStartDate}</span>
        <input name="startDate" type="date" onChange={resetValidation} />
      </label>

      <label>
        <span>{extra.employerDeadline}</span>
        <input name="deadline" type="date" onChange={resetValidation} />
      </label>

      <label className="wide-field">
        <span>{extra.employerResponsibilities}</span>
        <textarea required name="responsibilities" rows="4" placeholder={extra.employerResponsibilitiesPlaceholder} onChange={resetValidation} />
      </label>

      <label className="wide-field">
        <span>{extra.employerRequirements}</span>
        <textarea required name="requirements" rows="4" placeholder={extra.employerRequirementsPlaceholder} onChange={resetValidation} />
      </label>

      <label className="wide-field">
        <span>{extra.employerOffer}</span>
        <textarea name="offer" rows="3" placeholder={extra.employerOfferPlaceholder} onChange={resetValidation} />
      </label>

      <label className="wide-field">
        <span>{t.fields.message}</span>
        <textarea name="message" rows="3" onChange={resetValidation} />
      </label>

      <label className="confidential-field wide-field">
        <input type="checkbox" name="confidential" onChange={resetValidation} />
        <span>{extra.employerConfidential}</span>
      </label>
    </>
  )
}
