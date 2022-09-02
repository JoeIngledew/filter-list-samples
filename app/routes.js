const express = require('express')
const router = express.Router()
const data = require('./data/filter-list-data.json')

// Add your routes here - above the module.exports line
router.get('/filter-list', function(req, res) {
    const distinct = (acc, curr) => {
        if (acc.includes(curr))
            return acc
        return [...acc, curr]
    }

    const countries = data.items
        .map(x => x.country)
        .reduce(distinct, [])
        .map(x => ({ value: x, text: x }))
    const statuses = data.items
        .map(x => x.status)
        .reduce(distinct, [])
        .map(x => ({ value: x, text: x }))
    const companies = data.items
        .map(x => x.company)
        .reduce(distinct, [])
        .map(x => ({ value: x, text: x }))

    const listItems = data.items.map(a => {
        return [
            { html: '<a href="#" class="govuk-link">' + a.referenceNumber + '</a>' },
            { html: a.fullName },
            { html: a.country },
            { html: a.company },
            { html: a.status }
        ]
    })
    
    res.render('filter-list', { listItems, countries, statuses, companies })
})

router.get('/filter-list-html', function(req, res) {
    const getFilterValue = (f) => {
        if (!f) return []
        if (typeof f === "string") return [f]
        return f
    };
    const filters = {
        country: getFilterValue(req.query.country),
        company: getFilterValue(req.query.company),
        status: getFilterValue(req.query.status),
        search: req.query.search || null
    }

    const distinct = (acc, curr) => {
        if (acc.includes(curr))
            return acc
        return [...acc, curr]
    }

    const countries = data.items
        .map(x => x.country)
        .reduce(distinct, [])
        .map(x => {
            const count = data.items.filter(y => y.country === x).length
            return { value: x, text: `${x} (${count})`, checked: filters.country.includes(x) }
        })
    const statuses = data.items
        .map(x => x.status)
        .reduce(distinct, [])
        .map(x => {
            const count = data.items.filter(y => y.status === x).length
            return { value: x, text: `${x} (${count})`, checked: filters.status.includes(x) }
        })
    const companies = data.items
        .map(x => x.company)
        .reduce(distinct, [])
        .map(x => {
            const count = data.items.filter(y => y.company === x).length
            return { value: x, text: `${x} (${count})`, checked: filters.company.includes(x) }
        })

    const listItems = data.items
        .filter(x => {
            const hasCountry = !filters.country.length || filters.country.some(c => c === x.country)
            const hasCompany = !filters.company.length || filters.company.some(c => c === x.company)
            const hasStatus = !filters.status.length || filters.status.some(c => c === x.status)
            const hasSearch = !filters.search || x.fullName.includes(filters.search) || x.referenceNumber.includes(filters.search)

            return hasCompany && hasCountry && hasSearch && hasStatus
        })

    res.render('filter-list-html', { listItems, countries, statuses, companies, filters })
})

router.post('/filter-list-html', function(req, res) {
    const filters = {
        country: req.body.country,
        company: req.body.company,
        status: req.body.status,
        search: req.body.search
    }

    let queryString = []
    if (filters.country && filters.country !== '_unchecked' && filters.country.length) {
        const countryFilter = typeof filters.country === "string"
            ? [filters.country]
            : filters.country
        queryString = [...queryString, ...countryFilter.filter(x => x !== '_unchecked').map(x => `country=${x}`)]
    }

    if (filters.company && filters.company !== '_unchecked' && filters.company.length) {
        const companyFilter = typeof filters.company === "string"
            ? [filters.company]
            : filters.company
        queryString = [...queryString, ...companyFilter.filter(x => x !== '_unchecked').map(x => `company=${x}`)]
    }

    if (filters.status && filters.status !== '_unchecked' && filters.status.length) {
        const statusFilter = typeof filters.status === "string"
            ? [filters.status]
            : filters.status
        queryString = [...queryString, ...statusFilter.filter(x => x !== '_unchecked').map(x => `status=${x}`)]
    }
    
    if (filters.search)
        queryString = [...queryString, `search=${filters.search}`]

    const finalQuery = !!queryString
        ? `?${queryString.join('&')}`
        : ''

    res.redirect(`/filter-list-html${finalQuery}`)
})

module.exports = router
